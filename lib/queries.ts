export const galleriesQuery = `
  *[_type == "gallery" && isActive == true] | order(order asc) {
    _id,
    location,
    cover,
    photos,
    order,
    content {
      es {
        title,
        description
      },
      en {
        title,
        description
      }
    }
  }
`

export const productsQuery = `
  *[_type == "product" && isAvailable == true] | order(order asc) {
    _id,
    _type,
    category,
    image {
      asset-> {
        _id,
        url,
        metadata {
          dimensions
        }
      }
    },
    order,
    isAvailable,
    description {
      es,
      en
    },
    content {
      es {
        title,
        subtitle
      },
      en {
        title,
        subtitle
      }
    },
    tags,
    metadata {
      createdAt,
      updatedAt,
      featured
    }
  }
`

export const bioQuery = `
  *[_type == "bio"][0] {
    profileImage,
    content {
      es {
        title,
        paragraphs
      },
      en {
        title,
        paragraphs
      }
    }
  }
`

export const bookQuery = `
  *[_type == "book"][0] {
    coverImage,
    content {
      es {
        title,
        author,
        description,
        comingSoon,
        availability,
        emailPlaceholder,
        subscribe
      },
      en {
        title,
        author,
        description,
        comingSoon,
        availability,
        emailPlaceholder,
        subscribe
      }
    }
  }
`

export const documentariesQuery = `
  *[_type == "documentary" && isActive == true] | order(order asc, year desc) {
    _id,
    title {
      es,
      en
    },
    year,
    synopsis {
      es,
      en
    },
    trailerUrl,
    poster,
    order
  }
`

export const settingsQuery = `
  *[_type == "settings"][0] {
    homeSlideshow,
    favicon {
      asset-> {
        url,
        metadata {
          dimensions
        }
      }
    },
    content {
      es {
        siteTitle,
        siteDescription
      },
      en {
        siteTitle,
        siteDescription
      }
    },
    socialMedia {
      instagram,
      facebook,
      twitter,
      linkedin,
      youtube,
      tiktok
    }
  }
`
