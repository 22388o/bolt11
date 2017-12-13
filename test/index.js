'use strict'
let tape = require('tape')
let fixtures = require('./fixtures')
let lnpayreq = require('../')
let BN = require('bn.js')

fixtures.milliSatToHrp.valid.forEach((f) => {
  tape(`test millisatoshi to hrp string`, (t) => {
    t.plan(1)
    t.same(f.output, lnpayreq.milliSatToHrp(new BN(f.input, 10)))
  })
})

fixtures.milliSatToHrp.invalid.forEach((f) => {
  tape(`test millisatoshi to hrp string`, (t) => {
    t.plan(1)
    t.throws(() => {
      lnpayreq.milliSatToHrp(f.input)
    }, new RegExp(f.error))
  })
})

fixtures.hrpToMilliSat.valid.forEach((f) => {
  tape(`test hrp string to millisatoshi`, (t) => {
    t.plan(1)
    t.same(f.output, lnpayreq.hrpToMilliSat(f.input).toString())
  })
})

fixtures.hrpToMilliSat.invalid.forEach((f) => {
  tape(`test hrp string to millisatoshi`, (t) => {
    t.plan(1)
    t.throws(() => {
      lnpayreq.hrpToMilliSat(f.input)
    }, new RegExp(f.error))
  })
})

fixtures.encode.invalid.forEach((f) => {
  tape(`test vectors`, (t) => {
    t.plan(1)

    t.throws(() => {
      lnpayreq.encode(f.data, f.addDefaults)
    }, new RegExp(f.error))
  })
})

fixtures.decode.valid.forEach((f) => {
  tape(`test vectors`, (t) => {
    let decoded = lnpayreq.decode(f.paymentRequest)

    t.same(decoded.coinType, f.coinType)
    t.same(decoded.milliSatoshis, f.milliSatoshis)
    t.same(decoded.timestamp, f.timestamp)
    t.same(decoded.timestampString, f.timestampString)
    t.same(decoded.payeeNodeKey, f.payeeNodeKey)
    t.same(decoded.signature, f.signature)
    t.same(decoded.recoveryFlag, f.recoveryFlag)
    t.same(decoded.tags, f.tags)

    let tagPayeeNodeKey = decoded.tags.filter(item => item.tagName === 'payee_node_key')
    if (tagPayeeNodeKey.length > 0) {
      tagPayeeNodeKey = tagPayeeNodeKey[0]
      t.same(tagPayeeNodeKey, decoded.payeeNodeKey)
    }

    t.end()
  })

  tape(`test reverse without privateKey then with privateKey`, (t) => {
    let decoded = lnpayreq.decode(f.paymentRequest)
    let encodedNoPriv = lnpayreq.encode(decoded)

    delete decoded['signature']
    delete decoded['recoveryFlag']

    let encodedWithPrivObj = lnpayreq.encode(decoded, false)
    let signedData = lnpayreq.sign(encodedWithPrivObj, Buffer.from(f.privateKey, 'hex'))

    t.same(f.paymentRequest, encodedNoPriv.paymentRequest)
    t.same(f.paymentRequest, signedData.paymentRequest)

    t.end()
  })
})

fixtures.decode.invalid.forEach((f) => {
  tape(`test vectors`, (t) => {
    t.plan(1)

    t.throws(() => {
      lnpayreq.decode(f.paymentRequest)
    }, new RegExp(f.error))
  })
})
