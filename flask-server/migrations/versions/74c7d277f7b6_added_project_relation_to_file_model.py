"""added project relation to File model

Revision ID: 74c7d277f7b6
Revises: 2e6cb683078d
Create Date: 2024-01-02 12:58:47.957420

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '74c7d277f7b6'
down_revision = '2e6cb683078d'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('file', schema=None) as batch_op:
        batch_op.add_column(sa.Column('project_id', sa.Integer(), nullable=True))
        batch_op.create_foreign_key('fk_file_project_id', 'project', ['project_id'], ['id'])

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('file', schema=None) as batch_op:
        batch_op.drop_constraint('fk_file_project_id', type_='foreignkey')
        batch_op.drop_column('project_id')

    # ### end Alembic commands ###