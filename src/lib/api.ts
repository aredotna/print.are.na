import { apiBase } from "../config"
import flattenDeep from "lodash/flattenDeep"

const BASE = apiBase[process.env.NODE_ENV]

class API {
  get = (endpoint: string) => {
    return fetch(endpoint)
      .then(response => response.json())
      .catch(err => false)
  }

  getBlockCount = (slug: string) => {
    return this.get(`${BASE}/channels/${slug}/thumb`).then(data => data.length)
  }

  getPaginatedChannelContents = (slug: string, pageIndex: number, per = 25) => {
    return this.get(`${BASE}/channels/${slug}?page=${pageIndex}&per=${per}`)
  }

  getChannelContents = (slug: string) => {
    return this.getFullChannel(slug)
  }

  getFullChannel = (slug: string) => {
    const PER = 50
    const mergedContents: any = []
    const getChannelPage = (page: number) =>
      this.get(`${BASE}/channels/${slug}?per=${PER}&page=${page}`)

    return getChannelPage(1).then(channel => {
      mergedContents.push(channel.contents)

      const totalPages = Math.ceil((channel.length - 1) / PER)
      return Array(totalPages)
        .fill(undefined)
        .map((_, pageN) => pageN + 2)
        .reduce(
          (promise, pageN) =>
            promise
              .then(() => getChannelPage(pageN))
              .then(({ contents }) => mergedContents.push(contents)),
          Promise.resolve()
        )
        .then(_ => {
          const entireChannel = Object.assign({}, channel, {
            contents: flattenDeep(mergedContents),
          })
          return entireChannel
        })
    })
  }
}

export { API }