import db from './db.mjs';
import DeviceError from './device-error.mjs';

const defaultConfiguration = {
  name: null,
  lastOnline: null,
  startedAt: null,
  id: null,
  ip: null,
  syncd: true,
  reset: false,
  pins: [4, 5],
  buttons: ['tv', 'home theatre'],
  status: [0, 0],
};

async function fetchAll() {
  const devices = await db.findAll();
  return devices;
}

async function fetchOne(id) {
  const device = db.getById(id);

  if (device) {
    return device;
  }
  throw new DeviceError(`Board not found: ${id}`, 404);
}
async function findByIP(ip) {
  const device = await db.findByAttr('ip', ip);
  return device;
}
async function findByName(name) {
  const device = await db.findByAttr('name', name);
  return device;
}
async function update(id) {
  const device = await fetchOne(id);
  if (device) {
    device.lastOnline = new Date();
    await db.updateById(id, device);
    return device;
  }
  throw new DeviceError(`Board not found: ${id}`, 404);
}
async function add(name, ip) {
  let device = await findByName(name);
  const startedAt = new Date();
  if (device) {
    device.ip = ip;
    device.startedAt = startedAt;
    device.lastOnline = startedAt;
    const updatdDevice = await db.updateById(device.id, device);
    return updatdDevice;
  }
  device = await db.add({
    ...defaultConfiguration,
    name,
    ip,
    startedAt,
    lastOnline: startedAt,
    pins: defaultConfiguration.pins,
    status: defaultConfiguration.status,
  });
  return device;
}

async function set(id, options) {
  let device = await fetchOne(id);
  if (device) {
    device = { ...device, ...options };
    device.lastOnline = new Date();
    device.pins = options.pins.map(Number);
    device.status = options.status.map(Number);
    const updatdDevice = await db.updateById(id, device);
    return updatdDevice;
  }
  throw new DeviceError(`Board not found: ${id}`, 404);
}
async function setPin(id, pin, status) {
  const device = await fetchOne(id);
  if (device) {
    device.lastOnline = new Date();
    device.syncd = false;
    device.pins.forEach((p, index) => {
      if (pin === p) {
        device.status[index] = status;
      }
    });
    const updatdDevice = await db.updateById(id, device);
    return updatdDevice;
  }
  throw new DeviceError(`Board not found: ${id}`, 404);
}
async function getPin(id, pin) {
  const device = await fetchOne(id);
  if (device) {
    await update(device.id);
    let status;
    device.pins.forEach((p, index) => {
      if (pin === p) {
        status = device.status[index];
      }
    });
    return status;
  }
  throw new DeviceError(`Board not found: ${id}`, 404);
}

export default {
  fetchAll,
  fetchOne,
  set,
  update,
  add,
  findByIP,
  findByName,
  setPin,
  getPin,
};
