import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Endpoint from 'App/Models/Endpoint'
import LatencyDatapoint from 'App/Models/LatencyDatapoint'
import { base64 } from '@ioc:Adonis/Core/Helpers'

interface ChartConfig {
    title: {
        text: string
    }
    tooltip: {
        trigger: string
    }
    legend: {
        data: string[]
    }
    grid: {
        left: string
        right: string
        bottom: string
        containLabel: boolean
    }
    toolbox: {
        feature: {
            saveAsImage: {}
        }
    }
    xAxis: {
        type: string
        boundaryGap: boolean
        data: string[]
    }
    yAxis: {
        type: string
    },
    series: object[]
}

interface ChartConfigAverageSeriesData {
    name: string
    type: string
    stack: string
    data: number[]
}

export default class EndpointsController {
    public async index({ params, view }: HttpContextContract) {
        const endpointSlug: string = params.slug
        const endpoint = await Endpoint.query().where('slug', endpointSlug).preload('payloads', (payloadsQuery) => payloadsQuery.orderBy('created_at', 'desc')).preload('latency_datapoints', (latencyDatapointsQuery) => latencyDatapointsQuery.orderBy('created_at', 'asc'))

        const averageLoadTime: number = this.getAverageLoadTime(endpoint)

        const chartConfig = this.generateChartConfigData(endpoint[0].latency_datapoints)

        return view.render('dashboard/endpoint/index', {
            endpoint: endpoint[0],
            endpointSlug,
            averageLoadTime,
            payloadsList: endpoint[0].payloads,
            chartConfig: JSON.stringify(chartConfig)
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

    public getAverageLoadTime(endpoint: Endpoint[]) {
        let totalResponseTime: number = 0
        let averageLoadTime: number = 0
        for (let i = 0; i < endpoint[0].payloads.length; i++) {
            let duration: number = endpoint[0].payloads[i].data["duration"]
            totalResponseTime += duration
        }
        averageLoadTime = totalResponseTime / endpoint[0].payloads.length
        return averageLoadTime
    }

    public generateChartConfigData(datapoints: LatencyDatapoint[]) {
        const chartConfig: ChartConfig = {
            title: {
                text: 'Latency Percentiles'
            },
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: ['average']
                // data: ['average', 'p50', 'p95', 'p99']
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            toolbox: {
                feature: {
                    saveAsImage: {}
                }
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: []
            },
            yAxis: {
                type: 'value'
            },
            series: []
        }

        const chartConfigAverageSeriesData: ChartConfigAverageSeriesData = {
            name: 'average',
            type: 'line',
            stack: 'Total',
            data: []
        }

        for (let i = 0; i < datapoints.length; i++) {
            const datapointCategory = datapoints[i].category
            switch (datapointCategory) {
                case 'average':
                    const latencyValue = datapoints[i].value
                    chartConfigAverageSeriesData.data.push(latencyValue)
                    let xAxisData = new Date(datapoints[i]['$attributes'].createdAt).toLocaleString()
                    let dateString = xAxisData.slice(0, 5)
                    let timeString = xAxisData.slice(12, 17)
                    xAxisData = `${dateString}\n${timeString}`
                    chartConfig.xAxis.data.push(xAxisData)
                    break
            }
        }

        chartConfig.series.push(chartConfigAverageSeriesData)
        return chartConfig
    }
}
