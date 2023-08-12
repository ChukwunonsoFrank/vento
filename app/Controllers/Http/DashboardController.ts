import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Project from 'App/Models/Project'
import Endpoint from 'App/Models/Endpoint'

interface EndpointData {
    method: string
    urlPath: string
    endpointRequestsCount: number
    averageLoadTime: number
    slug: string
}

export default class DashboardController {
    public async index({ view }: HttpContextContract) {
        const project: Project[] = await Project.query().where('id', 1).preload('endpoints', (endpointsQuery) => {
            endpointsQuery.preload('payloads')
        })

        const endpoints = project[0].endpoints
        const totalEndpoints: number = endpoints.length
        const projectRequestsCount: number = project[0].requests_count
        let endpointsList: EndpointData[] = []

        for (let i = 0; i < endpoints.length; i++) {
            const method: string = endpoints[i].method
            const urlPath: string = endpoints[i].url_path
            const endpointRequestsCount: number = endpoints[i].requests_count
            const slug: string = endpoints[i].slug
            const averageLoadTime: number = this.getAverageLoadTime(endpoints[i])
            endpointsList.push({
                method,
                urlPath,
                endpointRequestsCount,
                averageLoadTime,
                slug
            })
        }

        return view.render('dashboard/index', {
            endpointsList,
            projectRequestsCount,
            totalEndpoints
        })
    }

    public getAverageLoadTime(endpoint: Endpoint) {
        let totalResponseTime: number = 0
        let averageLoadTime: number = 0
        for (let j = 0; j < endpoint.payloads.length; j++) {
            let duration: number = endpoint.payloads[j].data["duration"]
            totalResponseTime += duration
        }
        averageLoadTime = totalResponseTime / endpoint.payloads.length
        return averageLoadTime
    }
}
