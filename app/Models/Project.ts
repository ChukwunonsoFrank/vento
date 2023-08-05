import { DateTime } from 'luxon'
import { BaseModel, column, hasOne, HasOne, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import ApiKey from 'App/Models/ApiKey'
import Payload from 'App/Models/Payload'
import Endpoint from 'App/Models/Endpoint'

export default class Project extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public title: string

  @column()
  public slug: string

  @column()
  public description: string

  @column()
  public requests_count: number

  @hasOne(() => ApiKey, {
    foreignKey: 'project_id'
  })
  public api_key: HasOne<typeof ApiKey>

  @hasMany(() => Payload, {
    foreignKey: 'project_id'
  })
  public payloads: HasMany<typeof Payload>

  @hasMany(() => Endpoint, {
    foreignKey: 'project_id'
  })
  public endpoints: HasMany<typeof Endpoint>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
