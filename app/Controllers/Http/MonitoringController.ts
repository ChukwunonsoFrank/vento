import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Endpoint from 'App/Models/Endpoint'
import Payload from 'App/Models/Payload'
import Project from 'App/Models/Project'
import LatencyDatapoint from 'App/Models/LatencyDatapoint'

export default class MonitoringController {
    public async ingest({ request }: HttpContextContract) {
        const project = await Project.all()
        const { method, raw_url } = request.body()
        const existingEndpoint = await Endpoint.query().where('method', method).where('url_path', raw_url).first()

        if (existingEndpoint) {
            existingEndpoint.requests_count = existingEndpoint.requests_count + 1
            await Payload.create({
                endpoint_id: existingEndpoint.$attributes.id,
                slug: 'e3b2-4acb-c4ab-a34eb12',
                data: request.body()
            })
            await existingEndpoint.save()

            const endpoint = await Endpoint.query().where('id', existingEndpoint.id).preload('payloads')
            const sortedResponseTimes = endpoint[0].payloads.map(payload => payload.data["duration"]).sort((a, b) => a - b)
            const p50 = this.getP50LoadTime(sortedResponseTimes, sortedResponseTimes.length)
            const averageLoadTime = this.getAverageLoadTime(endpoint)

            await LatencyDatapoint.createMany([
                {
                    endpoint_id: existingEndpoint.id,
                    value: averageLoadTime,
                    category: 'average'
                },
                {
                    endpoint_id: existingEndpoint.id,
                    value: p50,
                    category: 'p50'
                }
            ])

        } else {
            const newEndpoint = await Endpoint.create({
                slug: '7748b78b-5895-4480-8229-468959fd5fba',
                method,
                url_path: raw_url,
                project_id: project[0]['$attributes'].id,
                requests_count: 1
            })

            await Payload.create({
                endpoint_id: newEndpoint.$attributes.id,
                slug: 'e3b2-4acb-c4ab-a34eb12',
                data: request.body()
            })

            const endpoint = await Endpoint.query().where('id', newEndpoint.id).preload('payloads')
            const averageLoadTime = this.getAverageLoadTime(endpoint)
            
            await LatencyDatapoint.create({
                endpoint_id: newEndpoint.id,
                value: averageLoadTime,
                category: 'average'
            })
        }

        project[0].requests_count = project[0].requests_count + 1
        await project[0].save()
    }

    public getAverageLoadTime(endpoint) {
        let totalResponseTime = 0
        let averageLoadTime = 0
        for (let i = 0; i < endpoint[0].payloads.length; i++) {
            let duration = endpoint[0].payloads[i].data["duration"]
            totalResponseTime += duration
        }
        averageLoadTime = totalResponseTime / endpoint[0].payloads.length
        return averageLoadTime
    }

    public getP50LoadTime(sortedResponseTimes, length) {
        let p50Position = (50 / 100) * length

        if (length % 2 !== 0) {
            p50Position = Math.round(p50Position)
        }

        if(length % 2 === 0) {
            p50Position = (sortedResponseTimes[p50Position] + sortedResponseTimes[p50Position + 1]) / 2
        }
        return sortedResponseTimes[p50Position]
    }
}
