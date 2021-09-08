//TODO: Create a table on MongoDB, this is an example
const ROLE = {
    ADMIN: 'admin',
    USER: 'user'
}

module.exports = {
    ROLE: ROLE,
    users: [
        { id: 1, name: 'Amanda', role: ROLE.ADMIN },
        { id: 2, name: 'Visitor', role: ROLE.USER }
    ]
}