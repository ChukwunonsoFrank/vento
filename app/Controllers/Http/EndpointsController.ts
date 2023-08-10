import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Endpoint from 'App/Models/Endpoint'
import { base64 } from '@ioc:Adonis/Core/Helpers'

export default class EndpointsController {
    public async index({ params, view }: HttpContextContract) {
        const endpointSlug: string = params.slug
        const endpoint = await Endpoint.query().where('slug', endpointSlug).preload('payloads')
        let avgLoadTime: number
        let responseTimeSum: number = 0
        for (let i = 0; i < endpoint[0].payloads.length; i++) {
            responseTimeSum += endpoint[0].payloads[i].data["duration"]
        }
        avgLoadTime = responseTimeSum / endpoint[0].payloads.length

        return view.render('dashboard/endpoint/index', {
            endpoint: endpoint[0],
            endpointSlug,
            avgLoadTime,
            payloadsList: endpoint[0].payloads
        })
    }

    public async show({ request, view }: HttpContextContract) {
        let payloadData = request.body().payload_data
        payloadData = JSON.parse(payloadData)
        if (payloadData.request_body) {
            payloadData.request_body = JSON.parse(base64.decode(payloadData.request_body))
        }

        if (payloadData.response_body) {
            payloadData.response_body = JSON.parse(base64.decode(payloadData.response_body))
        }

        return view.render('dashboard/endpoint/show', {
            payloadData: JSON.stringify(payloadData)
        })
    }
}


// {
//     "host": "localhost",
//         "method": "POST",
//             "raw_url": "/pay",
//                 "referer": "",
//                     "duration": 1.7728,
//                         "timestamp": "2023-08-06T21:17:18.146Z",
//                             "path_params": { },
//     "status_code": 200,
//         "query_params": { },
//     "request_body": "eyJjcmVkaXRfY2FyZCI6eyJuYW1lIjoiW1JFREFDVEVEX0JZX0NMSUVOVF0iLCJjdnYiOiJbUkVEQUNURURfQllfQ0xJRU5UXSIsImFjY3Rfbm8iOjIzMjIzNzgzNjN9fQ==", "response_body": "eyJzdGF0dXMiOjIwMCwibWVzc2FnZSI6eyJzdWNjZXNzIjoicGF5bWVudCBzdWNjZXNzZnVsIiwiZXJyb3IiOiJbUkVEQUNURURfQllfQ0xJRU5UXSJ9fQ==", "request_headers": {
//         "host": ["localhost:3000"],
//             "accept": ["*/*"],
//                 "user-agent": ["curl/7.85.0"],
//                     "content-type": ["application/json"],
//                         "content-length": ["77"]
//     },
//     "response_headers": {
//         "etag": ["W/\"52-FT6QGTBIoNHNb9rCIXDSImo9QTs\""],
//             "content-type": ["application/json; charset=utf-8"],
//                 "x-powered-by": ["Express"],
//                     "content-length": ["82"]
//     }
// }