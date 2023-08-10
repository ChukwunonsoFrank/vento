import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Project from 'App/Models/Project'

export default class DashboardController {
    public async index({ view }: HttpContextContract) {
        interface Endpoint {
            method: string
            urlPath: string
            requestsCount: number
            avgLoadTime: number
            slug: string
        }

        const project: Project[] = await Project.query().where('id', 1).preload('endpoints', (endpointsQuery) => {
            endpointsQuery.preload('payloads')
        })
        
        const endpoints = project[0].endpoints
        const endpointsTotal: number = endpoints.length
        const requestsTotal: number = project[0].requests_count
        let endpointsList: Endpoint[] = []

        for (let i = 0; i < endpoints.length; i++) {
            const method: string = endpoints[i].method
            const urlPath: string = endpoints[i].url_path
            const requestsCount: number = endpoints[i].requests_count
            const slug: string = endpoints[i].slug
            let avgLoadTime: number
            let responseTimeSum: number = 0
            for (let j = 0; j < endpoints[i].payloads.length; j++) {
                responseTimeSum += endpoints[i].payloads[j].data["duration"]
            }
            avgLoadTime = responseTimeSum / endpoints[i].payloads.length
            endpointsList.push({
                method,
                urlPath,
                requestsCount,
                avgLoadTime,
                slug
            })
        }

        return view.render('dashboard/index', {
            endpointsList,
            requestsTotal,
            endpointsTotal
        })
    }
}
