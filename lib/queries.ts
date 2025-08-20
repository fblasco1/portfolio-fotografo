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
    image,
    price,
    order,
    isAvailable,
    content {
      es {
        title,
        subtitle
      },
      en {
        title,
        subtitle
      }
    }
  }
`

export const bioQuery = `
  *[_type == "bio"][0] {
    profileImage,
    videoUrl,
    videoTitle,
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

export const settingsQuery = `
  *[_type == "settings"][0] {
    homeSlideshow,
    content {
      es {
        siteTitle,
        siteDescription
      },
      en {
        siteTitle,
        siteDescription
      }
    }
  }
`
