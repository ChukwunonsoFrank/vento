import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Endpoint from 'App/Models/Endpoint'
import Project from 'App/Models/Project'

export default class extends BaseSeeder {
  public async run () {
    // Write your database queries inside the run method
    await Project.create({
      title: 'vonta',
      slug: '2a4c-e3b2-4acb',
      description: 'Lorem ipsum'
    })

    await Endpoint.create({
      slug: '2a4c-e3b2-4acb-c4ab',
      method: 'POST',
      project_id: 1,
      url_path: '/pay'
    })
  }
}
