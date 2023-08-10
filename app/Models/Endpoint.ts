import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import Payload from 'App/Models/Payload'


export default class Endpoint extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public method: string

  @column()
  public project_id: number

  @column()
  public slug: string

  @column()
  public url_path: string

  @column()
  public requests_count: number

  @hasMany(() => Payload, {
    foreignKey: 'endpoint_id'
  })
  public payloads: HasMany<typeof Payload>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
