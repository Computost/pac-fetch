declare interface ObjectConstructor {
  /**
   * Returns the names of the enumerable string properties and methods of an object, assuming that all are in the Key type.
   * @param o Object that contains the properties and methods. This can be an object that you created or an existing Document Object Model (DOM) object.
   */
  keys<Key>(o: object): Key[];
}
