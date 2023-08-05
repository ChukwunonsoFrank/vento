import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Endpoint extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public method: string

  @column()
  public project_id: number

  @column()
  public url_path: string

  @column()
  public requests_count: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
