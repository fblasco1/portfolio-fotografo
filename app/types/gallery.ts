export interface Photo {
    id: number
    url: string
    title: string
    description: string
}

export interface Folder {
    id: number
    title: string
    location: string
    cover: string
    photos: Photo[]
}