import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class LatencyDatapoint extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public endpoint_id: number

  @column()
  public value: number

  @column()
  public category: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
