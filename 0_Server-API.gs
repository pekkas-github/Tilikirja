function api(methodName, arg1, arg2, arg3) {
  const lock = LockService.getScriptLock()
  const locked = lock.tryLock(15000)

  if(locked) {
    return model[methodName](arg1, arg2, arg3)
  }
  throw new Error('Tietokantaoperaation timeout ylittyi.')
}

function dbApi(methodName, arg1, arg2, arg3) {
  const lock = LockService.getScriptLock()
  const locked = lock.tryLock(15000)

  if(locked) {
    return db[methodName](arg1, arg2, arg3)
  }
  throw new Error('Tietokantaoperaation timeout ylittyi.')
}

function initApi(methodName, a1, a2, a3) {
  return db[methodName](a1, a2, a3)
}
