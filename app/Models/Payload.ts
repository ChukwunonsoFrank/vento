import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Payload extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public project_id: number

  @column()
  public data: {}

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}