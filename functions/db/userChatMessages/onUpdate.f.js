const functions = require('firebase-functions')
const admin = require('../../admin')

exports = module.exports = functions.database.ref('/user_chat_messages/{senderUid}/{receiverUid}/{messageUid}').onUpdate((data, context) => {
  if (context.authType === 'ADMIN') {
    return null
  }

  const senderUid = context.params.senderUid
  const receiverUid = context.params.receiverUid
  const messageUid = context.params.messageUid
  const senderChatRef = admin.database().ref(`/user_chats/${senderUid}/${receiverUid}`)
  const receiverChatRef = admin.database().ref(`/user_chats/${receiverUid}/${senderUid}`)
  const receiverChatMessageRef = admin.database().ref(`/user_chat_messages/${receiverUid}/${senderUid}/${messageUid}`)

  console.log(`Marking value`, data.after.child('isRead').val())

  if (data.after.child('isRead').val() === true) {
    console.log(`Marking message ${messageUid} as read`)
    return receiverChatMessageRef.update({
      isRead: context.timestamp
    }).then(() => {
      return senderChatRef.update({
        isRead: context.timestamp
      }).then(() => {
        receiverChatRef.update({
          isRead: context.timestamp
        })
      })
    })
  } else {
    return null
  }
})
