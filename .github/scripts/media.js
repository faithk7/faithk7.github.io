import fs from 'fs'
import path from 'path'

const filePath = process.argv[2]
const jsonString = process.argv[3]
const fileExists = fs.existsSync(filePath)

const photos = fileExists ? JSON.parse(fs.readFileSync(filePath).toString()) : []

const json = JSON.parse(jsonString)
photos.push(json)

const dirName = path.dirname(filePath)
if (!fileExists && dirName !== '.') {
  fs.mkdirSync(dirName, { recursive: true })
}

fs.writeFileSync(filePath, JSON.stringify(photos, null, 2))

if (!filePath.endsWith('stories.json')) process.exit()

const date = new Date(json.uploaded)
const content = `---
layout: story
date: ${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes()}
tags: ${JSON.stringify(json.meta.tags)}
title: ${JSON.stringify(json.meta.alt || json.meta.caption || `Photo — ${json.id}`)}
description: ${JSON.stringify(json.meta.caption || json.meta.alt || 'A photograph by Kai Qu.')}
image: ${JSON.stringify(json.variants[0])}
caption: ${JSON.stringify(json.meta.caption)}
alt: ${JSON.stringify(json.meta.alt)}
---

![${json.meta.alt}](${json.variants[0]})

${json.meta.caption}
`

fs.writeFileSync(`_stories/${json.id}.md`, content)
