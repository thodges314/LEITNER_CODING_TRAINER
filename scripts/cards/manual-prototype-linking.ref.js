function Animal(name) {
  this.name = name;
}

Animal.prototype.speak = function () {
  return this.name + ' makes a sound';
};

function Dog(name, breed) {
  Animal.call(this, name);
  this.breed = breed;
}

Dog.prototype = Object.create(Animal.prototype);
Object.defineProperty(Dog.prototype, 'constructor', {
  value: Dog,
  writable: true,
  enumerable: false,
  configurable: true,
});

Dog.prototype.speak = function () {
  return Animal.prototype.speak.call(this) + ' Woof!';
};
