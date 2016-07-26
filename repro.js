const expect = require('chai').expect
const mongoose = require('mongoose')
mongoose.Promise = global.Promise

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    default: '',
  }
})
const UserModel = mongoose.model('User', UserSchema)


const GroupSchema = new mongoose.Schema({
  name: String,
  members: [String],
})

const OrganizationSchema = new mongoose.Schema({
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  groups: [GroupSchema],
})
const OrganizationModel = mongoose.model('Organization', OrganizationSchema)

describe('mongoose array push', () => {
  before((cb) => {
    mongoose.connect('mongodb://localhost/mongoose_repro')
    mongoose.connection.on('open', cb)
  })

  beforeEach(() => {
    return OrganizationModel.create({
      members: [],
      groups: [],
    })
  })

  afterEach(() => OrganizationModel.remove({}).exec())

  it('should work when parent members is not populated', () => {
    return OrganizationModel.findOne({})
    .exec()
    .then((org) => {
      org.groups.push({ name: 'Rocket' })
      return org.save()
    })
    .then((org) => {
      const teamRocket = org.groups.find((team) => team.name === 'Rocket')
      teamRocket.members.push('Jessie')
      return org.save()
    })
    .then((org) => {
      const teamRocket = org.groups.find((team) => team.name === 'Rocket')
      expect(teamRocket.members).to.have.length(1)
      expect(teamRocket.members[0]).to.equal('Jessie')
    })
  })

  it('should work when parent members is populated', () => {
    return OrganizationModel.findOne({})
    .populate('members', 'name')
    .exec()
    .then((org) => {
      org.groups.push({ name: 'Rocket' })
      return org.save()
    })
    .then((org) => {
      const teamRocket = org.groups.find((team) => team.name === 'Rocket')
      console.log('team.members before', teamRocket.members)
      teamRocket.members.push('Jessie')
      console.log('team.members after', teamRocket.members)
      return org.save()
    })
    .then((org) => {
      const teamRocket = org.groups.find((team) => team.name === 'Rocket')
      expect(teamRocket.members).to.have.length(1)
      expect(teamRocket.members[0]).to.equal('Jessie')
    })
  })
})
