import SqlConstructor from "../index";

const users = SqlConstructor.usingPool('users', null);

const create = users.create;
create.serial('id').unique();
create.int('randomNumber');
create.real('floaty boi');
create.bool('isActive').withDefault(true);
create.bigint('unix').withDefault(0).nullable(false);
const nameCol = create.text('name');
const emailCol = create.text('email').nullable(false);
create.uniqueGroup([nameCol, emailCol]);
create.primaryGroup([nameCol]);
create.toString();

users.insert
    .columns({
        name: 'Johnny Bravo',
        email: 'e@mail'
    })
    .toString();

users.select
    .columns(['name', 'email'])
    .orderBy('name')
    .orderBy('id', false)
    .distinct('email')
    .where(row => (row.id === 1 || row.name === $ || row.name in $) && row.email != $,
        'John',
        ['Jeremy', 'Kyle'],
        '%gmail%')
    .limit(10)
    .offset(10)
    .toString();

users.update
    .columns({
        name: 'HueHueHue'
    })
    .where(row => row.id === 5)
    .toString();

users.delete
    .where(row => row.name === $, 'HueHueHue')
    .toString();