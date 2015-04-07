import anysort from 'anysort'

function getItemDefault (item) {
  return item
}

export default function ({
    collection,
    before=[],
    after=[],
    getItem=getItemDefault
}) {
  let collectionClone = []
  let refs = collection.reduce((memo, item) => {
    let normalized = getItem(item)
    collectionClone.push(normalized)

    memo[normalized] = item
    return memo
  }, {})

  return anysort.grouped(collectionClone, [before, 'unmatched', after]).map((item) => {
    return refs[item]
  })
}
