export class HeaderLibrary {
  public insertNumberOnContinuousHeaders<T>(
    stuff: T[],
    headerKey: string,
  ): ({
    whatHeader: string;
  } & T)[] {
    if (stuff.length >= 2) {
      return stuff.map((cookieValue, idx) => ({
        whatHeader: headerKey + (idx + 1),
        ...cookieValue,
      }));
    } else {
      return stuff.map((cookieValue) => ({
        whatHeader: headerKey,
        ...cookieValue,
      }));
    }
  }

  public wrapHeaderKeyInHeaderValue<T>(
    stuff: T,
    headerKey: string,
  ): {
    whatHeader: string;
  } & T {
    return { whatHeader: headerKey, ...stuff };
  }
}
