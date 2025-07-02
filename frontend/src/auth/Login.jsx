// src/auth/Login.jsx
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { login } from './authService';
import { loginSchema } from './validation';
import { useNavigate } from 'react-router-dom';
import '../auth/styles/Login.css'; 

function Login() {
  const navigate = useNavigate();

  const handleSubmit = async (values, actions) => {
    try {
      await login(values);
      navigate('/Pqr');
    } catch (err) {
      actions.setFieldError('general', 'Credenciales inválidas');
    }
  };

  return (
    <>
      <div className="header">
        <div>
          Iniciar <span>Sesión</span>
        </div>
      </div>
      <br />

      <div className="login">         
        <img src="/logo-2.png" alt="" className='logo-img'/>
        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={loginSchema}
          onSubmit={handleSubmit}
        >           
          {({ isSubmitting, errors }) => (
            <Form>
              <div>
                <Field
                  type="text"
                  name="userName"
                  placeholder="Usuario"
                />
                <ErrorMessage name="userName" component="div" className="error-message" />
              </div>

              <div>
                <Field
                  type="password"
                  name="password"
                  placeholder="Contraseña"
                />
                <ErrorMessage name="password" component="div" className="error-message" />
              </div>

              {errors.general && <div>{errors.general}</div>}

              <input
                type="submit"
                value="Login"
                disabled={isSubmitting}
              />
            </Form>
          )}
        </Formik>
      </div>
    </>
  );
}

export default Login;
