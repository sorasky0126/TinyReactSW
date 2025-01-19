import React from 'react';

export default (props: any): any => {
  return (
    <>
      <p>This is import component</p>
      <p>Hello {props.name}!</p>
    </>
  );
}
