function Animal(this: any, name: string): void {
  this.name = name;
}

Animal.prototype.speak = function (this: any): string {
  return this.name + ' makes a sound';
};

function Dog(this: any, name: string, breed: string): void {
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

Dog.prototype.speak = function (this: any): string {
  return Animal.prototype.speak.call(this) + ' Woof!';
};
