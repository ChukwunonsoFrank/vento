import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Endpoint from 'App/Models/Endpoint'
import Payload from 'App/Models/Payload'
import Project from 'App/Models/Project'

export default class MonitoringController {
    public async ingest ({ request }: HttpContextContract) {
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
        } else {
            const endpoint = await Endpoint.create({
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
        }

        project[0].requests_count = project[0].requests_count + 1
        await project[0].save()
    }
}
