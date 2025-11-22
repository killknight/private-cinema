'use strict'

// 数据库集合名称，可按需修改
const ROOMS_COLLECTION = 'rooms'
const BANNER_COLLECTION = 'opendb-banner'
// 引入配置中心
const uniConfigCenter = require('uni-config-center')
const uniImConfig = uniConfigCenter({
  pluginId: 'uni-im'
})

// 返回首页数据：热门包厢、主题包厢（来自数据库）；封面图片使用云存储临时链接
exports.main = async () => {
  const db = uniCloud.database()
  const collection = db.collection(ROOMS_COLLECTION)
  const bannerCol = db.collection(BANNER_COLLECTION)
  const cinemaInfoCol = db.collection('cinema_info')

  // 并行拉取两类数据与轮播
  const [hotRes, themedRes, bannerRes, cinemaInfoRes] = await Promise.all([
    collection.where({ hot: true }).orderBy('sort', 'asc').limit(6).get(),
    collection.where({ themed: true }).orderBy('sort', 'asc').limit(6).get(),
    bannerCol.where({ status: true }).orderBy('sort', 'asc').limit(5).get(),
    cinemaInfoCol.limit(1).get()
  ])
  let hotRooms = hotRes && hotRes.data ? hotRes.data : []
  let themedRooms = themedRes && themedRes.data ? themedRes.data : []
  let banners = bannerRes && bannerRes.data ? bannerRes.data : []
  const cinemaInfo = (cinemaInfoRes && cinemaInfoRes.data && cinemaInfoRes.data[0]) || null

  // 统一处理封面文件ID为临时URL
  hotRooms = await attachTempFileURL(hotRooms)
  themedRooms = await attachTempFileURL(themedRooms)
  banners = await mapBannerFiles(banners)

  // 兜底：若数据库为空，返回少量演示数据
  if (!hotRooms.length && !themedRooms.length) {
    hotRooms = mockRooms(6)
    themedRooms = mockRooms(6)
  }

  const business = cinemaInfo ? {
    openTime: cinemaInfo.openTime || '10:00',
    closeTime: cinemaInfo.closeTime || '24:00',
    tags: Array.isArray(cinemaInfo.tags) ? cinemaInfo.tags : [],
    address: cinemaInfo.address,
    latitude: cinemaInfo.latitude,
    longitude: cinemaInfo.longitude,
    cinemaName: cinemaInfo.cinemaName,
		phone: cinemaInfo.phone
  } : { 
    openTime: '10:00', 
    closeTime: '24:00', 
    tags: ['4K HDR','杜比音效','私密空间','主题包厢'],
    address: '北京市朝阳区建国路88号',
    latitude: 39.908823,
    longitude: 116.466544,
    cinemaName: '星展影院'
  }

  // 获取客服ID - 从数据库查询具有客服角色的用户
  let customerServiceUids = []
  try {
    // 从数据库查询具有客服角色的用户
    const userCollection = db.collection('uni-id-users')
    // 查询条件：isCustomerService为true或role数组包含'customerService'
    const userRes = await userCollection.where({
      $or: [
        { isCustomerService: true },
        { role: db.command.all(['customerService']) }
      ]
    }).get()
    
    if (userRes && userRes.data && userRes.data.length > 0) {
      customerServiceUids = userRes.data.map(user => user._id)
    }
    console.log('查询到的客服用户ID列表:', customerServiceUids)
  } catch (error) {
    console.error('获取客服ID失败:', error)
  }

  return { code: 0, msg: 'ok', data: { hotRooms, themedRooms, banners, business, customerServiceUids } }
}

// 将对象数组中的 cover fileID 转为临时URL
async function attachTempFileURL(list) {
  if (!Array.isArray(list) || list.length === 0) return []
  const fileIds = list
    .map((it) => (typeof it.cover === 'string' ? it.cover : ''))
    .filter((v) => v && !v.startsWith('http'))

  if (fileIds.length === 0) return list

  // 获取临时链接
  const { fileList } = await uniCloud.getTempFileURL({ fileList: fileIds })
  const map = new Map()
  ;(fileList || []).forEach((f) => {
    // 兼容不同返回结构：fileID 或 file_id
    map.set(f.fileID || f.file_id, f.tempFileURL || f.temp_url)
  })

  return list.map((it) => ({
    ...it,
    cover: typeof it.cover === 'string' && !it.cover.startsWith('http')
      ? (map.get(it.cover) || it.cover)
      : it.cover
  }))
}

// 演示数据兜底
function mockRooms(n) {
  const names = ['情侣主题房1','家庭欢聚房','漫威主题房','电竞观赛房','女神专享房','复古胶片房']
  const capacity = [2, 4, 6, 4, 2, 6]
  const list = []
  for (let i = 0; i < n; i++) {
    list.push({
      id: 'r' + i,
      name: names[i % names.length],
      capacity: capacity[i % capacity.length],
      cover: '/static/uni-center/headers.png'
    })
  }
  return list
}

// 处理 bannerfile 为临时URL或直接URL
async function mapBannerFiles(list) {
  if (!Array.isArray(list) || list.length === 0) return []
  const fileIds = list
    .map((it) => {
      const f = it.bannerfile
      if (!f) return ''
      if (typeof f === 'string') return f
      if (typeof f === 'object') return f.fileID || f.file_id || f.url
      return ''
    })
    .filter((v) => v && !String(v).startsWith('http'))

  if (fileIds.length) {
    const { fileList } = await uniCloud.getTempFileURL({ fileList: fileIds })
    const map = new Map()
    ;(fileList || []).forEach((f) => {
      map.set(f.fileID || f.file_id, f.tempFileURL || f.temp_url)
    })
    return list.map((it) => {
      const f = it.bannerfile
      let url = ''
      if (typeof f === 'string') {
        url = f.startsWith('http') ? f : (map.get(f) || f)
      } else if (f && typeof f === 'object') {
        const maybeId = f.fileID || f.file_id
        url = f.url || (maybeId ? (map.get(maybeId) || maybeId) : '')
      }
      return { title: it.title || '', url, open_url: it.open_url || '' }
    })
  }
  // 全是URL的场景
  return list.map((it) => ({ title: it.title || '', url: (it.bannerfile && it.bannerfile.url) || it.bannerfile, open_url: it.open_url || '' }))
}