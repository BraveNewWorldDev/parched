#anymatch = require 'anymatch'
anysort = require 'anysort'


defaultGetItem = (item) ->
  item


module.exports = ({collection, before, after, getItem}) ->
  before ||= []
  after ||= []
  getItem ||= defaultGetItem

  copy = []
  refs = {}

  for item in collection
    normalized = getItem item
    copy.push normalized
    refs[normalized] = item

  for item in anysort.grouped(copy, [before, 'unmatched', after])
    refs[item]
