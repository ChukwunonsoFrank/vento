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
            let responseTimeSum: number = 0
            let avgLoadTime: number = 0
            for (let i = 0; i < endpoint[0].payloads.length; i++) {
                let duration: number = endpoint[0].payloads[i].data["duration"]
                responseTimeSum += duration
            }
            avgLoadTime = responseTimeSum / endpoint[0].payloads.length

            await LatencyDatapoint.create({
                endpoint_id: existingEndpoint.id,
                value: avgLoadTime,
                category: 'average'
            })
        } else {
            const endpoint = await Endpoint.create({
                slug: '7748b78b-5895-4480-8229-468959fd5fba',
                method,
                url_path: raw_url,
                project_id: project[0]['$attributes'].id,
                requests_count: 1
            })

            await Payload.create({
                endpoint_id: endpoint.$attributes.id,
                slug: 'e3b2-4acb-c4ab-a34eb12',
                data: request.body()
            })

            const endpointsInDB = await Endpoint.query().where('id', endpoint.id).preload('payloads')
            let responseTimeSum: number = 0
            let avgLoadTime: number = 0
            for (let i = 0; i < endpointsInDB[0].payloads.length; i++) {
                let duration: number = endpointsInDB[0].payloads[i].data["duration"]
                responseTimeSum += duration
            }
            avgLoadTime = responseTimeSum / endpointsInDB[0].payloads.length

            await LatencyDatapoint.create({
                endpoint_id: endpoint.id,
                value: avgLoadTime,
                category: 'average'
            })
        }

        project[0].requests_count = project[0].requests_count + 1
        await project[0].save()
    }
}
