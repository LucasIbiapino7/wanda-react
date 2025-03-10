import PropTypes from "prop-types";
import './ProfileFunction.css'

function ProfileFunction({ functionCode }) {
  return (
    <div className="profile-function">
      <h3>Minha Estratégia</h3>
      <pre>
        <code>{functionCode}</code>
      </pre>
    </div>
  );
}

ProfileFunction.propTypes = {
  functionCode: PropTypes.string
};

export default ProfileFunction;
