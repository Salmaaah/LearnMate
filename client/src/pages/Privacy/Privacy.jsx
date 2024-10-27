const Privacy = () => {
  return (
    <main className="policies">
      <h1>Privacy Policy</h1>
      <p>
        <strong>Last Updated: October 26, 2024</strong>
      </p>
      <p>
        LearnMate values your privacy. This Privacy Policy outlines how we
        collect, use, and protect your information when you use our web
        application.
      </p>
      <br />
      <ol>
        <li>
          <h3>Information We Collect</h3>
          <p>We may collect the following types of information:</p>
          <ol>
            <li>
              <h4> Personal Information: </h4>
              <p>
                When you create an account, we collect information such as your
                name, email address, and any other information you provide.
              </p>
            </li>
            <li>
              <h4>Usage Data: </h4>
              <p>
                We collect information about how you use our services, including
                access times, pages viewed, and other interaction data.
              </p>
            </li>
          </ol>
        </li>

        <li>
          <h3>How We Use Your Information</h3>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, maintain, and improve our services</li>
            <li>
              Communicate with you regarding your account and our services
            </li>
            <li>
              Monitor the usage of our application and analyze trends to enhance
              user experience
            </li>
          </ul>
        </li>

        <li>
          <h3>Data Security</h3>
          <p>
            We implement reasonable security measures to protect your
            information from unauthorized access, loss, or misuse. However, no
            method of transmission over the Internet or method of electronic
            storage is 100% secure, and we cannot guarantee its absolute
            security.
          </p>
        </li>

        <li>
          <h3>Data Retention</h3>
          <p>
            We retain your personal information only as long as necessary for
            the purposes set out in this Privacy Policy. When your information
            is no longer needed, we will securely delete or anonymize it.
          </p>
        </li>

        <li>
          <h3>Third-Party Services</h3>
          <p>
            LearnMate may contain links to third-party websites or services that
            are not operated by us. We are not responsible for the content or
            privacy practices of these third parties. We encourage you to review
            the privacy policies of any third-party sites you visit.
          </p>
        </li>

        <li>
          <h3>Use of OpenAI API Services</h3>
          <p>
            In providing AI-powered features, LearnMate utilizes OpenAI’s API.
            This means that when users engage with these features, certain
            information (such as user-provided text) is shared with OpenAI for
            processing. This information is only shared as needed to provide
            these AI-driven functionalities and is not retained by LearnMate
            after the interaction.
          </p>
          <p>
            OpenAI operates under its own data policies and retention practices.
            For more information on how OpenAI handles data, please refer to{' '}
            <a href="https://openai.com/policies/privacy-policy/">
              OpenAI’s Privacy Policy
            </a>
            .
          </p>
        </li>

        <li>
          <h3>Changes to This Privacy Policy</h3>
          <p>
            We may update our Privacy Policy from time to time. We will notify
            you of any changes by posting the new Privacy Policy on our site.
            You are advised to review this Privacy Policy periodically for any
            changes.
          </p>
        </li>
      </ol>
    </main>
  );
};

export default Privacy;
