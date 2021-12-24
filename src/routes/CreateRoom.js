import React from "react";
import { v1 as uuid } from "uuid";
import { Link, Outlet} from "react-router-dom";

const CreateRoom = (props) => {
    const id = '/room/' + uuid();
    console.log(id);

    return (
        <>
      <nav>
        <ul>
          <li>
            {<Link
              to={id}>
              Contact</Link>}
          </li>
        </ul>
      </nav>

      <Outlet />
    </>
    );
};

export default CreateRoom;