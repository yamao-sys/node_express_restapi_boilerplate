export default (): void => {
  console.log('Setup test environment')

  process.env.NODE_ENV = 'test'
  process.env.DB_HOST ||= 'db'
  process.env.DB_NAME = 'simple_todo_test'
  process.env.DB_DROP_SCHEMA = 'true'
  process.env.JWT_SECRET = 'd43c3a6876a003dcae605b95a0389f370c4bd613c8d5c55532b47be38266e266'
}
