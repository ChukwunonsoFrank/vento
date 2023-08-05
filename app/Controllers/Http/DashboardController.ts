import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Project from 'App/Models/Project'

export default class DashboardController {
    public async index({ view }: HttpContextContract) {
        const project = await Project.find(1)
        const endpoints_count = (await Project.query().preload('endpoints')).length
        const requests_count = project?.requests_count
        return view.render('dashboard/index', {
            requests_count,
            endpoints_count
        })
    }
}
