import axios from "axios";
import fs from "fs/promises";

axios
  .post(
    "https://auth.elllephant.com/oauth/token",
    {
      client_id: "D06ZEXqOypJQrqRuyh6HinvfnHCYfz6w",
      client_secret:
        "ewFP6KmRR9RmtwKokIi7gHxUEkguKUShdNpdJxnHjFOj1JfmtVDdjJouWLzHpKHE",
      audience: "https://api.elllephant.com",
      grant_type: "client_credentials",
    },
    {
      headers: {
        "content-type": "application/json",
      },
    },
  )
  .then((response) => {
    fs.writeFile("local/token.json", JSON.stringify(response.data));
  })
  .catch((error) => {
    console.error(error);
  });
