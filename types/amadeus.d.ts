declare module 'amadeus' {
  interface AmadeusConfig {
    clientId: string | undefined;
    clientSecret: string | undefined;
    hostname?: string;
  }

  class Amadeus {
    constructor(config: AmadeusConfig);
    shopping: {
      flightOffersSearch: {
        get(params: any): Promise<any>;
      };
      flightDestinations: {
        get(params: any): Promise<any>;
      };
      flightDates: {
        get(params: any): Promise<any>;
      };
    };
    referenceData: {
      locations: {
        get(params: any): Promise<any>;
      };
    };
  }

  export default Amadeus;
}
