import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Project from 'App/Models/Project'

export default class DashboardController {
    public async index({ view }: HttpContextContract) {
        interface Endpoint {
            method: string
            url_path: string
            requests_count: number
            avg_load_time: string
            slug: string
        }

        const project = await Project.query().where('id', 1).preload('endpoints', (endpointsQuery) => {
            endpointsQuery.preload('payloads')
        })

        const endpoints_total = project[0].endpoints.length
        const requests_total = project[0].requests_count
        let endpoints_list: Endpoint[] = []
        for (let i = 0; i < project[0].endpoints.length; i++) {
            const method = project[0].endpoints[i].method
            const url_path = project[0].endpoints[i].url_path
            const requests_count = project[0].endpoints[i].requests_count
            const slug = project[0].endpoints[i].slug
            let avg_load_time
            let response_time_sum = 0
            for (let j = 0; j < project[0].endpoints[i].payloads.length; j++) {
                response_time_sum += project[0].endpoints[i].payloads[j].data["duration"]
            }
            avg_load_time = response_time_sum / project[0].endpoints[i].payloads.length
            endpoints_list.push({
                method,
                url_path,
                requests_count,
                avg_load_time,
                slug
            })
        }
        
        return view.render('dashboard/index', {
            endpoints_list,
            requests_total,
            endpoints_total
        })
    }
}
