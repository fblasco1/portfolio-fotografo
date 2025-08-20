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

// Tipos para Sanity CMS con internacionalización
export interface SanityPhoto {
    _key: string
    asset: {
        _ref: string
        _type: string
    }
}

export interface SanityGalleryContent {
    title: string
    description?: string
}

export interface SanityGallery {
    _id: string
    location: string
    cover: {
        asset: {
            _ref: string
            _type: string
        }
    }
    photos: SanityPhoto[]
    order: number
    isActive: boolean
    content: {
        es: SanityGalleryContent
        en: SanityGalleryContent
    }
}