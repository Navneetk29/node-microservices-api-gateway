const JWT_TOKEN_SECRET_KEY = 'd7iJljSFwLkT4rIC9xQKbVDqXBma8a1tQenUIqSFdyT';
const jwt = require('jsonwebtoken');

function checkToken(req){
    try{
        const {access_token} = req.cookies;
        let user = {};
        if(!access_token){
            return null;
        }
        user = jwt.verify(access_token , JWT_TOKEN_SECRET_KEY);
        if(!user){
            return null;
        }
        return user;

    }catch(err){
        console.log(err);
    }
}

module.exports = {
    checkToken,
}



// //   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIzLCJuYW1lIjoicmFqbmVlc2giLCJpYXQiOjE3ODQ3MTU5MjAsImV4cCI6MTc4NTMyMDcyMH0.XK4f6_UXtWcLDyCMtJ3Aszt8CnFRti4Gx7Y5rDV6nCk

// const token = jwt.sign(
//     {id: 123, name: 'rajneesh'}, JWT_TOKEN_SECRET_KEY,
//     {expiresIn : '7d'}
// )

// console.log(token);

// const JWT_TOKEN_SECRET_KEY_2 = 'd7iJljSFwLkT4rIC9xQKbVDqXBma8a1tQenUIqSFdyT'

// try{
//     const data = jwt.verify(token , JWT_TOKEN_SECRET_KEY_2);
//     console.log(data);
// }catch(err){
//     console.log(err);
// }