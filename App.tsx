import React from 'react';

export default () => {
  const [response, setResponse] = React.useState<string>('');

  React.useEffect(() => {
    fetch('./api/')
      .then(response => response.text())
      .then(data => setResponse(data))
      .catch(error => console.error("Fetching data failed", error));
  }, []);

  return (
    <>
      <h1>Hello World!</h1>
      <p>{response}</p>
    </>
  );
}
