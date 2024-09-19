export const generateUserErrorInfo = (user) => {

    return `Una o mas de las propiedades esta incompleta o no es valida
    Lista de propiedades:
    * first_name: Necesita ser un string, se recibio ${user.first_name}
    * last_name: Necesita ser un string, se recibio ${user.last_name}
    * email: Necesita ser un string, se recibio ${user.email}
    * age: Necesita ser un int, se recibio ${user.age}`
}

export const generateProductErrorInfo = (product) => {
    return `Una o mas de las propiedades esta incompleta o no es valida
    Lista de propiedades:
    * first_name: Necesita ser un string, se recibio ${product.name}
    * description: Necesita ser un string, se recibio ${product.description}
    * price: Necesita ser un int, se recibio ${product.price}
    * category: Necesita ser un string, se recibio ${product.category}
    * available: Necesita ser un booleano, se recibio ${product.available}`
}