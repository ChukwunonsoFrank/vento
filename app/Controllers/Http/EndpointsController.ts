import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Endpoint from 'App/Models/Endpoint'
// import LatencyDatapoint from 'App/Models/LatencyDatapoint'
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

interface ChartConfigSeriesData {
    name: string
    type: string
    stack: string
    data: number[]
}

export default class EndpointsController {
    public async index({ params, view }: HttpContextContract) {
        const endpointSlug = params.slug
        const endpoint = await Endpoint.query().where('slug', endpointSlug).preload('payloads', (payloadsQuery) => payloadsQuery.orderBy('created_at', 'desc')).preload('latency_datapoints', (latencyDatapointsQuery) => latencyDatapointsQuery.orderBy('created_at', 'asc'))

        const averageLoadTime = this.getAverageLoadTime(endpoint)

        const chartConfig = this.generateChartConfigData(endpoint[0].latency_datapoints)
        console.dir(chartConfig)

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

    public getAverageLoadTime(endpoint) {
        let totalResponseTime = 0
        let averageLoadTime = 0
        for (let i = 0; i < endpoint[0].payloads.length; i++) {
            let duration = endpoint[0].payloads[i].data["duration"]
            totalResponseTime += duration
        }
        averageLoadTime = totalResponseTime / endpoint[0].payloads.length
        return averageLoadTime
    }

    public generateChartConfigData(datapoints) {
        const chartConfig: ChartConfig = {
            title: {
                text: 'Latency Percentiles'
            },
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: ['average', 'p50']
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

        const chartConfigAverageSeriesData: ChartConfigSeriesData = {
            name: 'average',
            type: 'line',
            stack: 'Total',
            data: []
        }

        const chartConfigP50SeriesData: ChartConfigSeriesData = {
            name: 'p50',
            type: 'line',
            stack: 'Total',
            data: []
        }

        for (let i = 0; i < datapoints.length; i++) {
            const datapointCategory = datapoints[i].category
            switch (datapointCategory) {
                case 'average':
                    let averageLatencyValue = datapoints[i].value
                    chartConfigAverageSeriesData.data.push(averageLatencyValue)
                    let averageXAxisData = new Date(datapoints[i]['$attributes'].createdAt).toLocaleString()
                    let averageDateString = averageXAxisData.slice(0, 5)
                    let averageTimeString = averageXAxisData.slice(12, 17)
                    averageXAxisData = `${averageDateString}\n${averageTimeString}`
                    chartConfig.xAxis.data.push(averageXAxisData)
                    break
                case 'p50':
                    let p50LatencyValue = datapoints[i].value
                    chartConfigP50SeriesData.data.push(p50LatencyValue)
                    let p50XAxisData = new Date(datapoints[i]['$attributes'].createdAt).toLocaleString()
                    let p50DateString = p50XAxisData.slice(0, 5)
                    let p50TimeString = p50XAxisData.slice(12, 17)
                    p50XAxisData = `${p50DateString}\n${p50TimeString}`
                    chartConfig.xAxis.data.push(p50XAxisData)
                    break
            }
        }

        chartConfig.series.push(chartConfigAverageSeriesData)
        chartConfig.series.push(chartConfigP50SeriesData)
        return chartConfig
    }
}
