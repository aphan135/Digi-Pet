import { Cat } from "../components/pet/PetWidget";

function Profile() {
  return (
    <section className="profile-pet-page" aria-label="Profile">
      <Cat className="profile-cat-sprite" />
    </section>
  );
}

export default Profile;
