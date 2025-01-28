export interface Photo {
    id: string
    src: string
    alt: string
}

export interface Folder {
    id: string
    name: string
    coverPhoto: Photo
    photos: Photo[]
}