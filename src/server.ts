import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';
import StatusCodes from 'http-status-codes';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());


  
  // Function check Image Url
  function isImageUrl(url : any) {
    if(typeof url !== 'string' || !url || url === "") return false;
    return(url.match(/^http[^\?]*.(jpg|jpeg|png|bmp)(\?(.*))?$/gmi) != null);
  }

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  app.get("/filteredimage", async ( request : Request, response : Response ) => {

    // Try -Catch Block
    try {

      // declare variable urlImagePath
      let urlImagePath = request.query.image_url;

      // 1. validate the urlImagePath query
      if (!isImageUrl(urlImagePath)) {

        response.statusCode = StatusCodes.BAD_REQUEST;
        response.send("Image url is required format!!!");

        return;
      }

      // 2. call filterImageFromURL(urlImagePath) to filter the image
      await filterImageFromURL(urlImagePath).then(  
        function(imageFilePath) {
          // 3. send the resulting file in the response
          response.sendFile(imageFilePath, async (error: Error) => {
            if (error) {
              // Response send error Internal Server
              response.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
              response.send(error.message);
            } else {
              // 4. deletes any files on the server on finish of the response
              await deleteLocalFiles([imageFilePath]);
              response.statusCode = StatusCodes.OK;
            }
          });
      },
        function(error: Error) { 
          response.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
          response.send(error.message);
        }  
      );

    } catch (error) {
      response.send(error);     
    }
  });
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async (request: Request , response: Response) => {
    response.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();