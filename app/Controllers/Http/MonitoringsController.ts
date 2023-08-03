import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class MonitoringController {
    public ingest ({ request }: HttpContextContract) {
        console.log(request.body())
    }
}
