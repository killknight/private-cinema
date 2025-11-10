# 快捷回复数据表设计

## 集合名称
`uni-im-quick-replies`

## 字段设计

| 字段名 | 类型 | 必填 | 默认值 | 描述 |
|-------|------|------|--------|------|
| _id | String | 是 | 自动生成 | 文档ID，系统自动生成 |
| content | String | 是 | 无 | 快捷回复的内容文本 |
| sort | Number | 否 | 0 | 排序序号，用于控制显示顺序，数字越小越靠前 |
| status | Boolean | 否 | true | 状态标志，true表示启用，false表示禁用 |
| type | String | 否 | "customerService" | 快捷回复类型，customerService表示客服，user表示普通用户 |
| remark | String | 否 | "" | 备注信息，可选 |
| create_by | String | 是 | 无 | 创建者ID，关联用户系统 |
| update_by | String | 是 | 无 | 最后更新者ID |
| create_date | Date | 否 | 当前时间 | 创建时间戳 |
| update_date | Date | 否 | 当前时间 | 更新时间戳 |

## 索引设计

| 索引类型 | 字段 | 描述 |
|---------|------|------|
| 普通索引 | sort | 优化排序查询性能 |
| 普通索引 | status | 优化状态筛选查询性能 |
| 复合索引 | { status: 1, sort: 1 } | 优化按状态筛选并排序的查询 |

## 数据示例

```javascript
{
  "_id": "5f9a1b7c6e4d3c2a1b8e7f6d",
  "content": "您好，欢迎使用在线客服！请问有什么可以帮助您的？",
  "sort": 1,
  "status": true,
  "type": "customerService",
  "remark": "客服开场白",
  "create_by": "user123",
  "update_by": "user123",
  "create_date": "2023-11-01T08:00:00.000Z",
  "update_date": "2023-11-01T08:00:00.000Z"
}
```

## 查询场景

1. **获取所有启用的快捷回复**（用于客服端显示）
   ```javascript
   db.collection('uni-im-quick-replies')
     .where({ status: true, type: 'customerService' })
     .orderBy('sort', 'asc')
     .get()
   ```

2. **获取所有快捷回复**（用于管理后台）
   ```javascript
   db.collection('uni-im-quick-replies')
     .orderBy('sort', 'asc')
     .get()
   ```

3. **获取指定类型的快捷回复**
   ```javascript
   db.collection('uni-im-quick-replies')
     .where({ type: 'customerService' })
     .orderBy('sort', 'asc')
     .get()
   ```

4. **添加新的快捷回复**
   ```javascript
   db.collection('uni-im-quick-replies').add({
     content: "感谢您的咨询，祝您生活愉快！",
     sort: 5,
     status: true,
     type: "customerService",
     create_by: "admin456",
     update_by: "admin456"
   })
   ```

5. **更新快捷回复**
   ```javascript
   db.collection('uni-im-quick-replies')
     .doc('5f9a1b7c6e4d3c2a1b8e7f6d')
     .update({
       content: "更新后的回复内容",
       sort: 2,
       status: false,
       type: "user",
       update_by: "admin456",
       update_date: db.serverDate()
     })
   ```

6. **删除快捷回复**
   ```javascript
   db.collection('uni-im-quick-replies')
     .doc('5f9a1b7c6e4d3c2a1b8e7f6d')
     .remove()
   ```

## 数据安全

1. 仅管理员账户有权限进行创建、更新、删除操作
2. 普通客服账户只能读取启用状态的快捷回复
3. 建议添加用户认证中间件，验证操作权限
4. 重要操作建议记录操作日志，便于审计