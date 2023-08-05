import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Endpoint from 'App/Models/Endpoint'
import Payload from 'App/Models/Payload'
import Project from 'App/Models/Project'

export default class MonitoringController {
    public async ingest ({ request }: HttpContextContract) {
        const project = await Project.all()
        await Payload.create({
            project_id: project[0]['$attributes'].id,
            data: request.body()
        })

        const { method, raw_url } = request.body()
        const existingEndpoint = await Endpoint.query().where('method', method).where('url_path', raw_url).first()
        if (existingEndpoint) {
            existingEndpoint.requests_count = existingEndpoint.requests_count + 1
            await existingEndpoint.save()
        } else {
            await Endpoint.create({
                method,
                url_path: raw_url,
                project_id: project[0]['$attributes'].id,
                requests_count: 1
            })
        }

        project[0].requests_count = project[0].requests_count + 1
        await project[0].save()
    }
}
