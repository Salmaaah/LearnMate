import PropertySelector from '../Shared/PropertySelector/PropertySelector';

const EditMenu = ({ name, subject, tags }) => {
  return (
    <ul className="editMenu">
      <li className="editMenu__name">{name}</li>
      <PropertySelector
        property="Subject"
        selectedValues={subject}
        availableValues={[
          { id: 1, name: 'Subject 1', color: 'purple' },
          { id: 2, name: 'Subject 2', color: 'gray' },
        ]}
      />
      <PropertySelector
        property="Project"
        selectedValues={[{ id: 1, name: 'Project 1', color: 'purple' }]}
        availableValues={[
          { id: 1, name: 'Project 1', color: 'purple' },
          { id: 2, name: 'Project 2', color: 'gray' },
        ]}
      />
      <PropertySelector
        property="Tags"
        selectedValues={[
          { id: 3, name: 'tag 1', color: 'purple' },
          { id: 4, name: 'tag 2', color: 'gray' },
          { id: 5, name: 'tag 3', color: 'gray' },
        ]}
        availableValues={[
          { id: 6, name: 'tag 1', color: 'purple' },
          { id: 7, name: 'tag 2', color: 'gray' },
          { id: 8, name: 'tag 3', color: 'gray' },
        ]}
      />
    </ul>
  );
};

export default EditMenu;
